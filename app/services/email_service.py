"""
Сервис для отправки email-уведомлений
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

# Конфигурация для отправки email
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    TEMPLATE_FOLDER=None,
)

fastmail = FastMail(conf)


async def send_email(
    subject: str,
    recipients: List[str],
    body: str,
    html_body: Optional[str] = None
):
    """
    Отправить email
    
    Args:
        subject: Тема письма
        recipients: Список получателей
        body: Текст письма (plain text)
        html_body: HTML версия письма (опционально)
    """
    try:
        message = MessageSchema(
            subject=subject,
            recipients=recipients,
            body=body,
            subtype="html" if html_body else "plain"
        )
        
        if html_body:
            message.body = html_body
        
        await fastmail.send_message(message)
        logger.info(f"Email отправлен: {subject} -> {recipients}")
        return True
    except Exception as e:
        logger.error(f"Ошибка отправки email: {e}")
        # Не прерываем выполнение, если email не отправился
        return False


async def send_registration_notification(email: str, full_name: str, company: str):
    """Отправить уведомление о регистрации (заявка отправлена на рассмотрение)"""
    subject = "Заявка на регистрацию отправлена на рассмотрение - ZAKUP.ONE"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #2563eb;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
            }}
            .footer {{
                background-color: #f3f4f6;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-radius: 0 0 5px 5px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ZAKUP.ONE</h1>
            </div>
            <div class="content">
                <h2>Здравствуйте, {full_name}!</h2>
                <p>Спасибо за регистрацию на платформе <strong>ZAKUP.ONE</strong>.</p>
                <p>Ваша заявка на регистрацию от компании <strong>{company}</strong> успешно отправлена на рассмотрение администратору.</p>
                <p>Мы рассмотрим вашу заявку в ближайшее время и уведомим вас о результате по email.</p>
                <p>Обычно рассмотрение заявки занимает 1-2 рабочих дня.</p>
                <p>После одобрения заявки вы сможете войти в систему и начать работу с платформой.</p>
                <p>Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами.</p>
                <p>С уважением,<br>Команда ZAKUP.ONE</p>
            </div>
            <div class="footer">
                <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(subject, [email], "", html_body)


async def send_verification_approved_notification(email: str, full_name: str):
    """Отправить уведомление об одобрении заявки"""
    subject = "Ваша заявка одобрена - ZAKUP.ONE"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #10b981;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
            }}
            .button {{
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .footer {{
                background-color: #f3f4f6;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-radius: 0 0 5px 5px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Заявка одобрена</h1>
            </div>
            <div class="content">
                <h2>Здравствуйте, {full_name}!</h2>
                <p>Отличные новости! Ваша заявка на регистрацию в системе <strong>ZAKUP.ONE</strong> была <strong>одобрена</strong> администратором.</p>
                <p>Теперь вы можете войти в систему и начать пользоваться всеми возможностями платформы:</p>
                <ul>
                    <li>Просматривать каталог товаров</li>
                    <li>Создавать заявки на покупку</li>
                    <li>Отслеживать статус заказов</li>
                    <li>Управлять своим профилем</li>
                </ul>
                <p style="text-align: center;">
                    <a href="http://localhost:5467/login" class="button">Войти в систему</a>
                </p>
                <p>Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами.</p>
                <p>С уважением,<br>Команда ZAKUP.ONE</p>
            </div>
            <div class="footer">
                <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(subject, [email], "", html_body)


async def send_verification_rejected_notification(email: str, full_name: str, reason: Optional[str] = None):
    """Отправить уведомление об отклонении заявки"""
    subject = "Заявка на регистрацию отклонена - ZAKUP.ONE"
    
    reason_text = f"<p><strong>Причина:</strong> {reason}</p>" if reason else ""
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #ef4444;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                background-color: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
            }}
            .footer {{
                background-color: #f3f4f6;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-radius: 0 0 5px 5px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Заявка отклонена</h1>
            </div>
            <div class="content">
                <h2>Здравствуйте, {full_name}!</h2>
                <p>К сожалению, ваша заявка на регистрацию в системе <strong>ZAKUP.ONE</strong> была <strong>отклонена</strong> администратором.</p>
                {reason_text}
                <p>Если вы считаете, что это произошло по ошибке, или у вас есть дополнительные вопросы, пожалуйста, свяжитесь с нами для уточнения деталей.</p>
                <p>Вы можете подать новую заявку на регистрацию, если у вас изменились обстоятельства.</p>
                <p>С уважением,<br>Команда ZAKUP.ONE</p>
            </div>
            <div class="footer">
                <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(subject, [email], "", html_body)

