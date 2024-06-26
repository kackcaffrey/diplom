from django.shortcuts import redirect

class RedirectLogoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path == '/logout/':
            return redirect('login')
        return response
