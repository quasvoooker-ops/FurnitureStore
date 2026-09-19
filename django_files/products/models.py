from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('living', 'Living'),
        ('bedroom', 'Bedroom'),
        ('dining', 'Dining'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image = models.URLField(max_length=500, blank=True)
    rating = models.IntegerField(default=0)
    stock = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category})"
