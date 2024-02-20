from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from . import views, forms

urlpatterns = [
    path("", views.home, name="home"),
    path("auth/login/", views.login_user, name="login"),
    path("auth/signup/", views.sign_up, name="signup"),
    path("auth/logout/", views.logout_user, name="logout"),
    path("auth/change_password/", views.change_password, name="change_password"),
    path("auth/reset_password/", views.reset_password, name="reset_password"),
    path("auth/password_reset_done/", views.password_reset_done, name="password_reset_done"),
    path("auth/confirm_reset_password/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(
        template_name="main_app/password-reset/confirm_reset_password.html", form_class=forms.NewPasswordForm,
        success_url=reverse_lazy("password_reset_complete")
    ), name="confirm_reset_password"),
    path("auth/password_reset_complete/", views.password_reset_complete, name="password_reset_complete"),
    path("profile/", views.user_profile, name="username"),
    path('auth/confirm_code/', views.confirm_code, name='confirm_code'),
    path('auth/resend_code/', views.resend_code, name='resend_code'),
    path('testing_view/', views.test_view, name='testing_view'), # Testing view here. Don't get lost
    path('products/add_product/', views.add_product, name='add_product'),
    path('privacy_policy/', views.privacy_policy, name='privacy_policy'),
    path('find_product/<str:slug>', views.find_product, name='find_product'),
    path('find_staff_cart/', views.find_staff_cart, name='find_staff_cart'),
    path('open_staff_carts/', views.open_staff_carts, name='open_staff_carts'),
    path('check_product_cart/<str:slug>', views.check_product_in_cart, name='check_product_cart'),
    path('products/update_product_price/', views.update_product_price, name='update_product_price'),
    path('products/edit_product/<str:slug>', views.edit_product, name='edit_product'),
    path('staff_carts/', views.staff_carts, name='staff_carts'),
    path('staff_carts/delete_item/', views.delete_item, name='delete_item'),
    path('debtors/', views.debtors, name='debtors'),
    path('debtors/get_debtor/<str:slug>', views.get_the_debtor, name='get_the_debtor'),
    path('get_debtors/', views.get_debtors, name='get_debtors'),
    path('add_debtor/', views.add_debtor, name='add_debtor'),
    path('update_debtor/', views.update_debtor, name='update_debtor'),
    path('transactions/make_payment/', views.make_payment, name='make_payment'),
    path('transactions/', views.get_transactions, name='transactions'),
]