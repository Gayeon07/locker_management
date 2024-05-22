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

class SwapRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    from_locker = models.ForeignKey(Locker, related_name='sent_requests', on_delete=models.CASCADE)
    to_locker = models.ForeignKey(Locker, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
