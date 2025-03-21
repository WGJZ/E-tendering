from django.contrib.auth.models import AbstractUser
from django.db import models

# Create models here.

class User(AbstractUser):
    """
    Custom user model that supports different user types
    """
    USER_TYPE_CHOICES = (
        ('CITY', 'City'),
        ('COMPANY', 'Company'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='COMPANY')
    organization_name = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

class CompanyProfile(models.Model):
    """
    Profile for company users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    registration_number = models.CharField(max_length=50)
    
    def __str__(self):
        return self.company_name

class Tender(models.Model):
    CATEGORY_CHOICES = [
        ('CONSTRUCTION', 'Construction'),
        ('INFRASTRUCTURE', 'Infrastructure'),
        ('SERVICES', 'Services'),
        ('TECHNOLOGY', 'Technology'),
        ('HEALTHCARE', 'Healthcare'),
        ('EDUCATION', 'Education'),
        ('TRANSPORTATION', 'Transportation'),
        ('ENVIRONMENT', 'Environment'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('AWARDED', 'Awarded'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='CONSTRUCTION')
    requirements = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    
    notice_date = models.DateTimeField()
    submission_deadline = models.DateTimeField()
    winner_date = models.DateTimeField(null=True, blank=True)
    construction_start = models.DateField(null=True, blank=True)
    construction_end = models.DateField(null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.category})"

class Bid(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bids')
    company = models.ForeignKey(User, on_delete=models.CASCADE)
    bidding_price = models.DecimalField(max_digits=12, decimal_places=2)
    documents = models.FileField(upload_to='bid_documents/')
    submission_date = models.DateTimeField(auto_now_add=True)
    is_winner = models.BooleanField(default=False)
    additional_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Bid for {self.tender.title} by {self.company.username}"
