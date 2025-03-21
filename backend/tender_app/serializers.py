from rest_framework import serializers
from .models import User, Tender, Bid

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'organization_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            user_type=validated_data['user_type'],
            organization_name=validated_data.get('organization_name', '')
        )
        return user

class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = [
            'id', 
            'title', 
            'description', 
            'budget', 
            'category',
            'requirements',
            'status',
            'notice_date',
            'submission_deadline',
            'winner_date',
            'construction_start',
            'construction_end',
            'created_by',
            'created_at'
        ]

class BidSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.username', read_only=True)
    tender_title = serializers.CharField(source='tender.title', read_only=True)
    tender_id = serializers.IntegerField(source='tender.id', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Bid
        fields = ['id', 'tender', 'tender_id', 'tender_title', 'company', 'company_name', 'bidding_price', 
                 'documents', 'submission_date', 'is_winner', 'additional_notes', 'status']
        read_only_fields = ['company', 'submission_date', 'is_winner']
        extra_kwargs = {
            'tender': {'write_only': True}
        }
    
    def get_status(self, obj):
        if obj.is_winner:
            return 'ACCEPTED'
        # If this tender has a winner but it's not this bid
        elif Bid.objects.filter(tender=obj.tender, is_winner=True).exists():
            return 'REJECTED'
        else:
            return 'PENDING' 