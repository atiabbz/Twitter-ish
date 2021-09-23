from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse


class User(AbstractUser):
    followers = models.ManyToManyField('self', related_name='following', blank=True, symmetrical=False)

    def serialize(self):
        return {
            'followers': [follower.username for follower in self.followers.all()],
            'following': [user.username for user in self.following.all()],
            'profileURL': reverse('profile', args=(self.username,))
        }

class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_posts')
    time = models.DateTimeField()
    likers = models.ManyToManyField(User, default=None, related_name='liked_posts')
    content = models.CharField(max_length=280)
    isEdited = models.BooleanField(default=False)

    def serialize(self):
        return {
            'id': self.id,
            'creator': self.creator.username,
            'time': self.time.strftime('%d %b %Y %I:%M %p'),
            'likers': [liker.username for liker in self.likers.all()],
            'content': self.content,
            'isEdited': self.isEdited,
            'creatorProfile': reverse('profile', args=(self.creator.username,))
        }