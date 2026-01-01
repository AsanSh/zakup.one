from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, RegisterView, VerifyEmailView, CurrentUserView, UserListView,
    UserViewSet, CompanyViewSet, SavedCompanyViewSet, SavedAddressViewSet,
    SavedRecipientViewSet, SubscriptionPlanViewSet, UserSubscriptionViewSet, UserCompanyViewSet,
    ChatThreadViewSet, ChatMessageViewSet, NotificationViewSet, InviteUserView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'saved-companies', SavedCompanyViewSet, basename='saved-company')
router.register(r'saved-addresses', SavedAddressViewSet, basename='saved-address')
router.register(r'saved-recipients', SavedRecipientViewSet, basename='saved-recipient')
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'subscriptions', UserSubscriptionViewSet, basename='subscription')
router.register(r'user-companies', UserCompanyViewSet, basename='user-company')
router.register(r'chat/thread', ChatThreadViewSet, basename='chat-thread')
router.register(r'notifications', NotificationViewSet, basename='notification')

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('invite-user/', InviteUserView.as_view(), name='invite-user'),
    path('chat/thread/<int:thread_pk>/messages/', ChatMessageViewSet.as_view({'get': 'list', 'post': 'create'}), name='chat-messages'),
]
