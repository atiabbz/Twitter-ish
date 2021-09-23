from django.contrib.auth import authenticate, login, logout
from django.core import paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from datetime import date, datetime
from .models import User
from .models import Post
import json
from django.core.paginator import Paginator


def index(request):
    return HttpResponseRedirect(reverse('all'))

def all(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def new(request):
    data = json.loads(request.body)
    creator = request.user
    content = data['content']
    post = Post(creator=creator, time=datetime.now(), content=content)
    post.save()
    return JsonResponse({'message': 'saveddd'})

def posts(request, username):
    if username == 'allFollowing':
        posts = Post.objects.none() #empty queryset
        following = User.objects.get(username=request.user).following.all()
        print(following)
        if (len(following) > 0):
            for username in following:
                user = User.objects.get(username=username)
                posts = posts.union(Post.objects.all().filter(creator=user))
            posts = posts.order_by('-time')
    elif username == 'all':
        posts = Post.objects.all().order_by('-time')
    else:
        user = User.objects.get(username=username)
        posts = Post.objects.filter(creator=user).order_by('-time')

    paginator = Paginator(posts, 3)
    body = dict()
    for n in paginator.page_range:
        page = paginator.page(n).object_list
        body[f'page{n}'] = [post.serialize() for post in page]
    # print(body)

    return JsonResponse(body)

def numPages(request, username):
    if username == 'allFollowing':
        posts = Post.objects.none()  #empty queryset
        following = User.objects.get(username=request.user).following.all()
        print(following)
        if (len(following) > 0):
            for username in following:
                user = User.objects.get(username=username)
                posts = posts.union(Post.objects.all().filter(creator=user))
            posts = posts.order_by('-time')
    elif username == 'all':
        posts = Post.objects.all().order_by('-time')
    else:
        user = User.objects.get(username=username)
        posts = Post.objects.filter(creator=user).order_by('-time')

    paginator = Paginator(posts, 3)
    return JsonResponse(paginator.num_pages, safe=False)


def likeUnlike(request):
    postId = json.loads(request.body)['postId']
    action = json.loads(request.body)['action']
    liker = request.user
    post = Post.objects.get(id=postId)

    if action == 'Like':
        post.likers.add(liker)
        post.save()
        return JsonResponse(f'post: {postId} liked by user: {liker}', safe=False)
    else:
        post.likers.remove(liker)
        post.save()
        return JsonResponse(f'post: {postId} unliked by user: {liker}', safe=False)

def edit(request):
    postId = json.loads(request.body)['postId']
    editContent = json.loads(request.body)['editContent']

    post = Post.objects.get(id=postId)

    post.isEdited = True
    post.content = editContent
    post.time = datetime.now()
    post.save()

    return JsonResponse(f'post {postId} edited', safe=False)

def profile(request, profileName):
    if (User.objects.filter(username=profileName).exists()):
        profile = User.objects.get(username=profileName)
        return render(request, 'network/profile.html', {
            'profileName': profileName,
            'followerCount': len(profile.followers.all()),
            'followingCount': len(profile.following.all()),
        })
    return render(request, 'network/nonexistent.html')

def followers(request, profileName):
    profile = User.objects.get(username=profileName)
    return render(request, 'network/followers.html', {
        'followers': profile.followers.all(),
    })

def following(request, profileName):
    profile = User.objects.get(username=profileName)
    return render(request, 'network/following.html', {
        'following': profile.following.all(),
    })

def followUnfollow(request):
    body = json.loads(request.body)
    action = body['action']
    profileName = body['profileName']
    user = request.user
    profile = User.objects.get(username=profileName)
    if action == 'Follow':
        profile.followers.add(user)
    else:
        profile.followers.remove(user)
    profile.save()
    return JsonResponse('done', safe=False)

def allFollowing(request):
    return render(request, 'network/allFollowing.html')

def profileInfo(request):
    profileName = json.loads(request.body)['profileName']
    profile = User.objects.get(username=profileName)
    # print(profile.followers.all())
    return JsonResponse(profile.serialize())

def paginatedPosts(request):
    posts = Post.objects.all().order_by('-time')

    paginator = Paginator(posts, 3)
    body = dict()
    for n in paginator.page_range:
        page = paginator.page(n).object_list
        body[f'page{n}'] = [post.serialize() for post in page]

    return JsonResponse(body)