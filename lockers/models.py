from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Locker(models.Model):
    FLOOR_CHOICES = [
        (1, '1층'),
        (2, '2층'),
    ]
    number = models.CharField(max_length=10)
    floor = models.IntegerField(choices=FLOOR_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.floor}층 - {self.number}"