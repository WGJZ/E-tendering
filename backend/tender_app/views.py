from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Tender, Bid, CompanyProfile
from .serializers import UserSerializer, TenderSerializer, BidSerializer
from django.db import transaction
from .permissions import IsCityUser, IsCompanyUser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView

# Create your views here.

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            })
        return Response({'error': 'Invalid credentials'}, 
                      status=status.HTTP_401_UNAUTHORIZED)

class TenderViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer
    permission_classes = [IsAuthenticated, IsCityUser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list' or self.action == 'retrieve' or self.action == 'bids':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsCityUser]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def bids(self, request, pk=None):
        """
        Return all bids for a specific tender
        """
        tender = self.get_object()
        # Log for debugging
        print(f"Fetching bids for tender {tender.id}: {tender.title}")
        
        bids = Bid.objects.filter(tender=tender)
        print(f"Found {bids.count()} bids for tender {tender.id}")
        
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return:
        - All bids for city users
        - Only own bids for company users
        """
        user = self.request.user
        if user.is_superuser or user.user_type == 'CITY':
            return Bid.objects.all()
        elif user.user_type == 'COMPANY':
            return Bid.objects.filter(company=user)
        return Bid.objects.none()

    def perform_create(self, serializer):
        # Print the request data for debugging
        print(f"Creating bid with data: {self.request.data}")
        try:
            serializer.save(company=self.request.user)
            print(f"Bid created successfully by {self.request.user.username}")
        except Exception as e:
            print(f"Error creating bid: {str(e)}")
            raise

    @action(detail=False, methods=['get'])
    def my_bids(self, request):
        """
        Return the bids submitted by the current user
        """
        user = request.user
        
        # Allow both company users and superusers to view bids
        # Superusers can view all bids, company users can only view their own
        if user.is_superuser:
            bids = Bid.objects.all()
        elif user.user_type == 'COMPANY':
            bids = Bid.objects.filter(company=user)
        else:
            # City users should see all bids too
            bids = Bid.objects.all()
        
        # Enhanced logging for debugging
        print(f"User {user.username} ({user.user_type}) retrieved {bids.count()} bids")
        
        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def select_winner(self, request, pk=None):
        """
        Allow city users to select a winning bid
        """
        if not (request.user.is_superuser or request.user.user_type == 'CITY'):
            return Response(
                {'detail': 'Only city users can select winners'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bid = self.get_object()
        tender = bid.tender
        
        # Reset all bids for this tender
        tender.bids.all().update(is_winner=False)
        
        # Set this bid as winner
        bid.is_winner = True
        bid.save()
        
        # Update tender status
        tender.status = 'AWARDED'
        tender.save()
        
        return Response({'detail': 'Winner selected successfully'})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user_type = request.data.get('user_type')
    
    user = authenticate(username=username, password=password)
    
    if user:
        # Super users can login as any user type
        if user_type and user.user_type != user_type and not user.is_superuser:
            return Response(
                {'message': f'Invalid user type. This account is not a {user_type} account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        refresh = RefreshToken.for_user(user)
        
        # For superusers logging in as CITY, return CITY as the user_type
        response_user_type = user_type if user.is_superuser and user_type else user.user_type
        
        return Response({
            'token': str(refresh.access_token),
            'user_type': response_user_type,
            'username': user.username
        })
    return Response({'message': 'Invalid credentials'}, 
                  status=status.HTTP_401_UNAUTHORIZED)

class UserRegistrationView(APIView):
    """
    View for user registration
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # Extract data from request
            data = request.data
            user_data = {
                'username': data.get('username'),
                'password': data.get('password'),
                'user_type': data.get('user_type', 'COMPANY')  # Default to COMPANY if not specified
            }
            
            # Validate user data
            if not user_data['username'] or not user_data['password']:
                return Response(
                    {'detail': 'Username and password are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if username already exists
            if User.objects.filter(username=user_data['username']).exists():
                return Response(
                    {'detail': 'Username already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create user based on user_type
            if user_data['user_type'] == 'COMPANY':
                # Extract company profile data
                company_profile_data = data.get('company_profile', {})
                
                # Validate company data
                required_fields = ['company_name', 'contact_email', 'registration_number']
                missing_fields = [field for field in required_fields if not company_profile_data.get(field)]
                
                if missing_fields:
                    return Response(
                        {'detail': f'Missing required fields: {", ".join(missing_fields)}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create user with transaction to ensure atomicity
                with transaction.atomic():
                    # Create the user
                    user = User.objects.create_user(
                        username=user_data['username'],
                        password=user_data['password'],
                        user_type=user_data['user_type']
                    )
                    
                    # Create company profile
                    company_profile = CompanyProfile.objects.create(
                        user=user,
                        company_name=company_profile_data.get('company_name'),
                        contact_email=company_profile_data.get('contact_email'),
                        phone_number=company_profile_data.get('phone_number'),
                        address=company_profile_data.get('address'),
                        registration_number=company_profile_data.get('registration_number')
                    )
                    
                    return Response(
                        {
                            'message': 'Company user registered successfully',
                            'user_id': user.id,
                            'username': user.username,
                            'user_type': user.user_type
                        },
                        status=status.HTTP_201_CREATED
                    )
            elif user_data['user_type'] == 'CITY':
                # Only superuser can create city users
                return Response(
                    {'detail': 'Only superusers can create city accounts.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            else:
                return Response(
                    {'detail': 'Invalid user type. Must be COMPANY or CITY.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            # Log the exception for debugging
            print(f"Registration error: {str(e)}")
            return Response(
                {'detail': f'Registration failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
