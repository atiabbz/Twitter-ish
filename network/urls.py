
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('numPages/<str:username>', views.numPages, name='numPages'),
    path('paginatedPosts', views.paginatedPosts, name='paginatedPosts'),
    path('all', views.all, name='all'),
    path('all/following', views.allFollowing, name='allFollowing'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('new', views.new, name='new'),
    path('posts/<str:username>', views.posts, name='posts'),
    path('likeUnlike', views.likeUnlike, name='likeUnfollow'),
    path('edit', views.edit, name='edit'),
    path('profile/<str:profileName>', views.profile, name='profile'),
    path('profile/<str:profileName>/followers', views.followers, name='followers'),
    path('profile/<str:profileName>/following', views.following, name='following'),
    path('profileInfo', views.profileInfo, name='profileInfo'),
    path('followUnfollow', views.followUnfollow, name='followUnfollow'),
]
