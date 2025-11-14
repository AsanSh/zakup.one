<?php
/**
 * Автоматическое развертывание упрощенной версии через браузер
 * Откройте: https://zakup.one/deploy_simple.php
 */

// Включаем отображение ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Безопасность: проверка хоста (упрощенная)
$allowed_hosts = ['zakup.one', 'www.zakup.one', 'localhost', '127.0.0.1', 'server41.shared.spaceship.host'];
$current_host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Настройки
$project_dir = __DIR__;
$venv_pip = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip';
$python = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/python3.11';

// Функция для безопасного выполнения команд
function executeCommand($command, $cwd = null) {
    $descriptorspec = [
        0 => ["pipe", "r"],
        1 => ["pipe", "w"],
        2 => ["pipe", "w"]
    ];
    
    $process = @proc_open($command, $descriptorspec, $pipes, $cwd);
    
    if (!is_resource($process)) {
        return ['success' => false, 'output' => 'Failed to execute command', 'error' => 'Process creation failed'];
    }
    
    @fclose($pipes[0]);
    
    $output = @stream_get_contents($pipes[1]);
    $error = @stream_get_contents($pipes[2]);
    
    @fclose($pipes[1]);
    @fclose($pipes[2]);
    
    $return_value = @proc_close($process);
    
    return [
        'success' => $return_value === 0,
        'output' => $output ?: '',
        'error' => $error ?: '',
        'return_code' => $return_value
    ];
}

// Обработка AJAX запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    
    $action = $_POST['action'] ?? '';
    $result = ['success' => false, 'message' => '', 'data' => []];
    
    try {
        switch ($action) {
            case 'check_files':
                // Проверка наличия файлов
                $files_to_check = [
                    'app/main_simple.py' => 'Упрощенная версия backend',
                    'wsgi_simple.py' => 'Упрощенный WSGI',
                    'requirements_simple.txt' => 'Упрощенные зависимости',
                    'frontend/dist/index.html' => 'Собранный frontend',
                    'app/main.py' => 'Текущий main.py',
                    'wsgi.py' => 'Текущий wsgi.py',
                ];
                
                $files_status = [];
                foreach ($files_to_check as $file => $description) {
                    $full_path = $project_dir . '/' . $file;
                    $exists = @file_exists($full_path);
                    $files_status[] = [
                        'file' => $file,
                        'description' => $description,
                        'exists' => $exists,
                        'size' => $exists ? @filesize($full_path) : 0,
                        'readable' => $exists ? @is_readable($full_path) : false,
                        'writable' => $exists ? @is_writable($full_path) : false,
                    ];
                }
                
                $result = [
                    'success' => true,
                    'message' => 'Проверка файлов завершена',
                    'data' => $files_status
                ];
                break;
                
            case 'backup_current':
                // Резервное копирование текущих файлов
                $files_to_backup = ['app/main.py', 'wsgi.py', 'requirements.txt'];
                $backup_dir = $project_dir . '/backup_' . date('Y-m-d_H-i-s');
                
                if (!@file_exists($backup_dir)) {
                    @mkdir($backup_dir, 0755, true);
                }
                
                $backup_results = [];
                foreach ($files_to_backup as $file) {
                    $source = $project_dir . '/' . $file;
                    if (@file_exists($source)) {
                        $dest = $backup_dir . '/' . basename($file);
                        if (@copy($source, $dest)) {
                            $backup_results[] = ['file' => $file, 'status' => 'backed up', 'path' => $dest];
                        } else {
                            $backup_results[] = ['file' => $file, 'status' => 'failed', 'error' => 'Copy failed'];
                        }
                    } else {
                        $backup_results[] = ['file' => $file, 'status' => 'not found', 'skipped' => true];
                    }
                }
                
                $result = [
                    'success' => true,
                    'message' => 'Резервное копирование завершено',
                    'data' => [
                        'backup_dir' => $backup_dir,
                        'files' => $backup_results
                    ]
                ];
                break;
                
            case 'rename_files':
                // Переименование файлов
                $rename_map = [
                    'app/main_simple.py' => 'app/main.py',
                    'wsgi_simple.py' => 'wsgi.py',
                    'requirements_simple.txt' => 'requirements.txt',
                ];
                
                $rename_results = [];
                foreach ($rename_map as $source => $dest) {
                    $source_path = $project_dir . '/' . $source;
                    $dest_path = $project_dir . '/' . $dest;
                    
                    if (!@file_exists($source_path)) {
                        $rename_results[] = [
                            'source' => $source,
                            'dest' => $dest,
                            'status' => 'failed',
                            'error' => 'Source file not found'
                        ];
                        continue;
                    }
                    
                    // Если файл назначения существует, переименуем его в .old
                    if (@file_exists($dest_path)) {
                        $old_backup = $dest_path . '.old';
                        @rename($dest_path, $old_backup);
                    }
                    
                    if (@rename($source_path, $dest_path)) {
                        $rename_results[] = [
                            'source' => $source,
                            'dest' => $dest,
                            'status' => 'success'
                        ];
                    } else {
                        $rename_results[] = [
                            'source' => $source,
                            'dest' => $dest,
                            'status' => 'failed',
                            'error' => 'Rename failed'
                        ];
                    }
                }
                
                $result = [
                    'success' => true,
                    'message' => 'Переименование файлов завершено',
                    'data' => $rename_results
                ];
                break;
                
            case 'install_dependencies':
                // Установка зависимостей
                $requirements_file = $project_dir . '/requirements.txt';
                
                if (!@file_exists($requirements_file)) {
                    $result = [
                        'success' => false,
                        'message' => 'Файл requirements.txt не найден',
                        'data' => []
                    ];
                    break;
                }
                
                // Проверяем наличие pip
                if (!@file_exists($venv_pip)) {
                    $result = [
                        'success' => false,
                        'message' => 'pip не найден в виртуальном окружении',
                        'data' => ['pip_path' => $venv_pip]
                    ];
                    break;
                }
                
                // Устанавливаем зависимости
                $command = escapeshellarg($venv_pip) . ' install -r ' . escapeshellarg($requirements_file) . ' 2>&1';
                $install_result = executeCommand($command, $project_dir);
                
                $result = [
                    'success' => $install_result['success'],
                    'message' => $install_result['success'] ? 'Зависимости установлены успешно' : 'Ошибка при установке зависимостей',
                    'data' => [
                        'output' => $install_result['output'],
                        'error' => $install_result['error'],
                        'return_code' => $install_result['return_code']
                    ]
                ];
                break;
                
            case 'check_packages':
                // Проверка установленных пакетов
                $required_packages = ['fastapi', 'uvicorn', 'python-multipart', 'python-dotenv'];
                $package_status = [];
                
                foreach ($required_packages as $package) {
                    $command = escapeshellarg($venv_pip) . ' show ' . escapeshellarg($package) . ' 2>&1';
                    $check_result = executeCommand($command, $project_dir);
                    
                    $package_status[] = [
                        'package' => $package,
                        'installed' => $check_result['success'],
                        'info' => $check_result['success'] ? $check_result['output'] : $check_result['error']
                    ];
                }
                
                $result = [
                    'success' => true,
                    'message' => 'Проверка пакетов завершена',
                    'data' => $package_status
                ];
                break;
                
            case 'test_import':
                // Тест импорта приложения
                $command = escapeshellarg($python) . ' -c "from app.main import app; print(\'OK\')" 2>&1';
                $import_result = executeCommand($command, $project_dir);
                
                $result = [
                    'success' => $import_result['success'],
                    'message' => $import_result['success'] ? 'Импорт приложения успешен' : 'Ошибка импорта приложения',
                    'data' => [
                        'output' => $import_result['output'],
                        'error' => $import_result['error']
                    ]
                ];
                break;
                
            case 'test_wsgi':
                // Тест WSGI
                $command = escapeshellarg($python) . ' -c "from wsgi import application; print(\'OK\')" 2>&1';
                $wsgi_result = executeCommand($command, $project_dir);
                
                $result = [
                    'success' => $wsgi_result['success'],
                    'message' => $wsgi_result['success'] ? 'WSGI работает' : 'Ошибка WSGI',
                    'data' => [
                        'output' => $wsgi_result['output'],
                        'error' => $wsgi_result['error']
                    ]
                ];
                break;
                
            default:
                $result = ['success' => false, 'message' => 'Unknown action: ' . $action, 'data' => []];
        }
    } catch (Exception $e) {
        $result = [
            'success' => false,
            'message' => 'Exception: ' . $e->getMessage(),
            'data' => ['trace' => $e->getTraceAsString()]
        ];
    } catch (Error $e) {
        $result = [
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'data' => ['trace' => $e->getTraceAsString()]
        ];
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Развертывание упрощенной версии - ZAKUP.ONE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        
        .content {
            padding: 30px;
        }
        
        .step {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
        }
        
        .step h3 {
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .step-number {
            background: #667eea;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        .btn:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-success {
            background: #28a745;
        }
        
        .btn-success:hover {
            background: #218838;
        }
        
        .result {
            margin-top: 15px;
            padding: 15px;
            border-radius: 6px;
            display: none;
        }
        
        .result.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            display: block;
        }
        
        .result.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            display: block;
        }
        
        .result.info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            display: block;
        }
        
        .result pre {
            background: rgba(0,0,0,0.05);
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            margin-top: 10px;
            font-size: 12px;
        }
        
        .file-list {
            list-style: none;
            margin-top: 10px;
        }
        
        .file-list li {
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .file-list li .status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status.exists {
            background: #d4edda;
            color: #155724;
        }
        
        .status.missing {
            background: #f8d7da;
            color: #721c24;
        }
        
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin: 15px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: #667eea;
            width: 0%;
            transition: width 0.3s;
        }
        
        .error-info {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Развертывание упрощенной версии</h1>
            <p>Автоматическая установка и настройка для Spaceship</p>
        </div>
        
        <div class="content">
            <div class="error-info" id="phpInfo">
                <strong>ℹ️ Информация о PHP:</strong><br>
                Версия: <?php echo phpversion(); ?><br>
                Директория проекта: <?php echo htmlspecialchars($project_dir); ?><br>
                Pip путь: <?php echo htmlspecialchars($venv_pip); ?><br>
                Pip существует: <?php echo @file_exists($venv_pip) ? '✅ Да' : '❌ Нет'; ?>
            </div>
            
            <!-- Шаг 1: Проверка файлов -->
            <div class="step">
                <h3>
                    <span class="step-number">1</span>
                    Проверка файлов
                </h3>
                <p>Проверяем наличие необходимых файлов для развертывания</p>
                <button class="btn" onclick="checkFiles()">Проверить файлы</button>
                <div id="checkFilesResult" class="result"></div>
            </div>
            
            <!-- Шаг 2: Резервное копирование -->
            <div class="step">
                <h3>
                    <span class="step-number">2</span>
                    Резервное копирование
                </h3>
                <p>Создаем резервную копию текущих файлов (опционально)</p>
                <button class="btn" onclick="backupCurrent()">Создать резервную копию</button>
                <div id="backupResult" class="result"></div>
            </div>
            
            <!-- Шаг 3: Переименование файлов -->
            <div class="step">
                <h3>
                    <span class="step-number">3</span>
                    Переименование файлов
                </h3>
                <p>Переименовываем упрощенные файлы в основные</p>
                <button class="btn" onclick="renameFiles()">Переименовать файлы</button>
                <div id="renameResult" class="result"></div>
            </div>
            
            <!-- Шаг 4: Установка зависимостей -->
            <div class="step">
                <h3>
                    <span class="step-number">4</span>
                    Установка зависимостей
                </h3>
                <p>Устанавливаем Python пакеты из requirements.txt</p>
                <button class="btn" onclick="installDependencies()">Установить зависимости</button>
                <div id="installResult" class="result"></div>
            </div>
            
            <!-- Шаг 5: Проверка пакетов -->
            <div class="step">
                <h3>
                    <span class="step-number">5</span>
                    Проверка установленных пакетов
                </h3>
                <p>Проверяем что все пакеты установлены корректно</p>
                <button class="btn" onclick="checkPackages()">Проверить пакеты</button>
                <div id="packagesResult" class="result"></div>
            </div>
            
            <!-- Шаг 6: Тест импорта -->
            <div class="step">
                <h3>
                    <span class="step-number">6</span>
                    Тест приложения
                </h3>
                <p>Проверяем что приложение импортируется без ошибок</p>
                <button class="btn" onclick="testImport()">Тест импорта</button>
                <button class="btn" onclick="testWsgi()">Тест WSGI</button>
                <div id="testResult" class="result"></div>
            </div>
            
            <!-- Автоматическое развертывание -->
            <div class="step" style="background: #fff3cd; border-color: #ffc107;">
                <h3>
                    <span class="step-number">⚡</span>
                    Автоматическое развертывание
                </h3>
                <p>Выполнить все шаги автоматически</p>
                <button class="btn btn-success" onclick="autoDeploy()">🚀 Автоматическое развертывание</button>
                <div class="progress-bar" id="progressBar" style="display: none;">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div id="autoDeployResult" class="result"></div>
            </div>
        </div>
    </div>
    
    <script>
        function showResult(elementId, success, message, data = null) {
            const element = document.getElementById(elementId);
            element.className = 'result ' + (success ? 'success' : 'error');
            element.style.display = 'block';
            
            let html = '<strong>' + escapeHtml(message) + '</strong>';
            
            if (data) {
                if (Array.isArray(data)) {
                    html += '<ul class="file-list">';
                    data.forEach(item => {
                        if (item.file) {
                            html += `<li>
                                <span>${escapeHtml(item.file)} <small>(${escapeHtml(item.description || '')})</small></span>
                                <span class="status ${item.exists ? 'exists' : 'missing'}">
                                    ${item.exists ? '✓ Найден' : '✗ Не найден'}
                                </span>
                            </li>`;
                        } else if (item.package) {
                            html += `<li>
                                <span>${escapeHtml(item.package)}</span>
                                <span class="status ${item.installed ? 'exists' : 'missing'}">
                                    ${item.installed ? '✓ Установлен' : '✗ Не установлен'}
                                </span>
                            </li>`;
                        }
                    });
                    html += '</ul>';
                } else if (typeof data === 'object') {
                    html += '<pre>' + escapeHtml(JSON.stringify(data, null, 2)) + '</pre>';
                } else {
                    html += '<pre>' + escapeHtml(String(data)) + '</pre>';
                }
            }
            
            element.innerHTML = html;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function showLoading(button) {
            button.disabled = true;
            const original = button.textContent;
            button.setAttribute('data-original', original);
            button.innerHTML = original + ' <span class="loading"></span>';
        }
        
        function hideLoading(button) {
            button.disabled = false;
            const original = button.getAttribute('data-original') || button.textContent;
            button.innerHTML = original;
        }
        
        async function makeRequest(action, button = null) {
            if (button) showLoading(button);
            
            try {
                const formData = new FormData();
                formData.append('action', action);
                
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                }
                
                const result = await response.json();
                return result;
            } catch (error) {
                return {
                    success: false,
                    message: 'Ошибка запроса: ' + error.message,
                    data: null
                };
            } finally {
                if (button) hideLoading(button);
            }
        }
        
        async function checkFiles() {
            const button = event.target;
            const result = await makeRequest('check_files', button);
            showResult('checkFilesResult', result.success, result.message, result.data);
        }
        
        async function backupCurrent() {
            const button = event.target;
            const result = await makeRequest('backup_current', button);
            showResult('backupResult', result.success, result.message, result.data);
        }
        
        async function renameFiles() {
            const button = event.target;
            const result = await makeRequest('rename_files', button);
            showResult('renameResult', result.success, result.message, result.data);
        }
        
        async function installDependencies() {
            const button = event.target;
            const result = await makeRequest('install_dependencies', button);
            showResult('installResult', result.success, result.message, result.data);
        }
        
        async function checkPackages() {
            const button = event.target;
            const result = await makeRequest('check_packages', button);
            showResult('packagesResult', result.success, result.message, result.data);
        }
        
        async function testImport() {
            const button = event.target;
            const result = await makeRequest('test_import', button);
            showResult('testResult', result.success, result.message, result.data);
        }
        
        async function testWsgi() {
            const button = event.target;
            const result = await makeRequest('test_wsgi', button);
            showResult('testResult', result.success, result.message, result.data);
        }
        
        async function autoDeploy() {
            const button = event.target;
            const resultDiv = document.getElementById('autoDeployResult');
            const progressBar = document.getElementById('progressBar');
            const progressFill = document.getElementById('progressFill');
            
            progressBar.style.display = 'block';
            button.disabled = true;
            button.innerHTML = '⏳ Выполняется развертывание...';
            
            const steps = [
                { name: 'Проверка файлов', action: 'check_files' },
                { name: 'Резервное копирование', action: 'backup_current' },
                { name: 'Переименование файлов', action: 'rename_files' },
                { name: 'Установка зависимостей', action: 'install_dependencies' },
                { name: 'Проверка пакетов', action: 'check_packages' },
                { name: 'Тест импорта', action: 'test_import' },
                { name: 'Тест WSGI', action: 'test_wsgi' },
            ];
            
            let log = '<strong>🚀 Автоматическое развертывание</strong><br><br>';
            let allSuccess = true;
            
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const progress = ((i + 1) / steps.length) * 100;
                progressFill.style.width = progress + '%';
                
                log += `<strong>Шаг ${i + 1}: ${step.name}</strong><br>`;
                
                const result = await makeRequest(step.action);
                
                if (result.success) {
                    log += `✅ ${escapeHtml(result.message)}<br>`;
                } else {
                    log += `❌ ${escapeHtml(result.message)}<br>`;
                    if (step.action === 'install_dependencies' || step.action === 'test_import' || step.action === 'test_wsgi') {
                        allSuccess = false;
                    }
                }
                
                if (result.data && typeof result.data === 'object') {
                    log += `<pre>${escapeHtml(JSON.stringify(result.data, null, 2))}</pre>`;
                }
                
                log += '<br>';
                
                // Небольшая задержка между шагами
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            resultDiv.className = 'result ' + (allSuccess ? 'success' : 'error');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = log;
            
            button.disabled = false;
            button.innerHTML = '🚀 Автоматическое развертывание';
            progressBar.style.display = 'none';
            progressFill.style.width = '0%';
        }
    </script>
</body>
</html>
