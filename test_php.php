<?php
/**
 * Простой тест PHP для проверки работоспособности
 * Откройте: https://zakup.one/test_php.php
 */

// Включаем отображение ошибок
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>PHP Test</title></head><body>";
echo "<h1>✅ PHP работает!</h1>";
echo "<h2>Информация о PHP:</h2>";
echo "<ul>";
echo "<li>Версия PHP: " . phpversion() . "</li>";
echo "<li>Директория скрипта: " . __DIR__ . "</li>";
echo "<li>Файл скрипта: " . __FILE__ . "</li>";
echo "<li>Права на запись: " . (is_writable(__DIR__) ? "✅ Да" : "❌ Нет") . "</li>";
echo "</ul>";

echo "<h2>Проверка файлов:</h2>";
$files_to_check = [
    'app/main_simple.py',
    'wsgi_simple.py',
    'requirements_simple.txt',
    'frontend/dist/index.html',
    'app/main.py',
    'wsgi.py',
];

echo "<ul>";
foreach ($files_to_check as $file) {
    $full_path = __DIR__ . '/' . $file;
    $exists = file_exists($full_path);
    echo "<li>" . htmlspecialchars($file) . ": " . ($exists ? "✅ Найден" : "❌ Не найден") . "</li>";
}
echo "</ul>";

echo "<h2>Проверка путей:</h2>";
$venv_pip = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip';
echo "<ul>";
echo "<li>Pip путь: " . htmlspecialchars($venv_pip) . "</li>";
echo "<li>Pip существует: " . (file_exists($venv_pip) ? "✅ Да" : "❌ Нет") . "</li>";
echo "</ul>";

echo "<h2>Проверка функций:</h2>";
echo "<ul>";
echo "<li>proc_open: " . (function_exists('proc_open') ? "✅ Доступна" : "❌ Недоступна") . "</li>";
echo "<li>exec: " . (function_exists('exec') ? "✅ Доступна" : "❌ Недоступна") . "</li>";
echo "<li>shell_exec: " . (function_exists('shell_exec') ? "✅ Доступна" : "❌ Недоступна") . "</li>";
echo "</ul>";

echo "<p><a href='deploy_simple.php'>→ Перейти к развертыванию</a></p>";
echo "</body></html>";
?>

