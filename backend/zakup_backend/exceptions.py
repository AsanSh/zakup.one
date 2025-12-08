from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Кастомный обработчик исключений для замены английских названий полей на русские
    """
    # Получаем стандартный ответ от DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Маппинг английских названий полей на русские
        field_names = {
            'phone': 'Телефон',
            'address': 'Адрес',
            'name': 'Название',
            'email': 'Email',
            'inn': 'ИНН',
            'contact_person': 'Контактное лицо',
            'full_name': 'Полное имя',
            'company_name': 'Название компании',
            'company_phone': 'Телефон',
            'company_inn': 'ИНН',
            'password': 'Пароль',
            'password_confirm': 'Подтверждение пароля',
            'file': 'Файл',
            'supplier_id': 'Поставщик',
        }
        
        # Если есть ошибки валидации
        if isinstance(response.data, dict):
            custom_data = {}
            for key, value in response.data.items():
                # Заменяем название поля на русское
                field_name = field_names.get(key, key)
                
                # Если значение - список ошибок
                if isinstance(value, list):
                    # Заменяем названия полей в сообщениях об ошибках
                    custom_errors = []
                    for error in value:
                        if isinstance(error, str):
                            # Заменяем название поля в тексте ошибки
                            error_text = error
                            for eng_name, rus_name in field_names.items():
                                error_text = error_text.replace(eng_name, rus_name)
                            custom_errors.append(error_text)
                        else:
                            custom_errors.append(error)
                    custom_data[field_name] = custom_errors
                # Если значение - строка
                elif isinstance(value, str):
                    # Заменяем название поля в тексте ошибки
                    error_text = value
                    for eng_name, rus_name in field_names.items():
                        error_text = error_text.replace(eng_name, rus_name)
                    custom_data[field_name] = error_text
                # Если значение - словарь (вложенные ошибки)
                elif isinstance(value, dict):
                    custom_data[field_name] = value
                else:
                    custom_data[field_name] = value
            
            response.data = custom_data
    
    return response

