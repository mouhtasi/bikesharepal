from django.shortcuts import render, redirect
from django.contrib.staticfiles.templatetags.staticfiles import static


def index(request):
    return render(request, 'website/index.html')


def favicon(request, *args):
    return redirect(static('favicon/' + request.build_absolute_uri().split('/')[-1]))
