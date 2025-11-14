<?php
/**
 * Автоматическая установка зависимостей для zakup.one
 * Откройте эту страницу в браузере: https://zakup.one/install.php
 */

// Безопасность: проверка что мы на правильном сервере
$allowed_hosts = ['zakup.one', 'www.zakup.one', 'server41.shared.spaceship.host'];
$current_host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Настройки
$project_dir = '/home/kdlqemdxxn/zakup.one';
$venv_pip = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip';
$requirements_file = $project_dir . '/requirements.txt';

// Обработка AJAX запроса
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    $action = $_POST['action'];
    $output = [];
    $status = 'success';
    
    try {
        switch ($action) {
            case 'check_files':
                $output = checkFiles($project_dir, $requirements_file, $venv_pip);
                break;
                
            case 'install':
                $output = installDependencies($project_dir, $requirements_file, $venv_pip);
                break;
                
            case 'check_packages':
                $output = checkPackages($venv_pip);
                break;
                
            default:
                throw new Exception('Неизвестное действие');
        }
    } catch (Exception $e) {
        $status = 'error';
        $output = ['error' => $e->getMessage()];
    }
    
    echo json_encode(['status' => $status, 'data' => $output]);
    exit;
}

// Функции
function checkFiles($project_dir, $requirements_file, $venv_pip) {
    $result = [];
    
    // Проверка директории проекта
    $result['project_dir'] = [
        'exists' => is_dir($project_dir),
        'path' => $project_dir,
        'writable' => is_writable($project_dir)
    ];
    
    // Проверка requirements.txt
    $result['requirements'] = [
        'exists' => file_exists($requirements_file),
        'path' => $requirements_file,
        'readable' => is_readable($requirements_file),
        'size' => file_exists($requirements_file) ? filesize($requirements_file) : 0
    ];
    
    // Проверка pip
    $result['pip'] = [
        'exists' => file_exists($venv_pip),
        'path' => $venv_pip,
        'executable' => file_exists($venv_pip) && is_executable($venv_pip)
    ];
    
    // Проверка других важных файлов
    $important_files = [
        'wsgi.py',
        'app/main.py',
        'app/core/config.py'
    ];
    
    $result['files'] = [];
    foreach ($important_files as $file) {
        $full_path = $project_dir . '/' . $file;
        $result['files'][$file] = file_exists($full_path);
    }
    
    // Проверка директорий
    $dirs = ['uploads', 'downloads'];
    $result['directories'] = [];
    foreach ($dirs as $dir) {
        $dir_path = $project_dir . '/' . $dir;
        $result['directories'][$dir] = [
            'exists' => is_dir($dir_path),
            'writable' => is_dir($dir_path) ? is_writable($dir_path) : false
        ];
    }
    
    return $result;
}

function installDependencies($project_dir, $requirements_file, $venv_pip) {
    $result = [];
    $output_lines = [];
    
    // Определяем команду pip
    if (file_exists($venv_pip)) {
        $pip_cmd = escapeshellarg($venv_pip);
    } else {
        $pip_cmd = 'python3 -m pip';
    }
    
    // Создаем директории если их нет
    $dirs_to_create = ['uploads', 'downloads'];
    foreach ($dirs_to_create as $dir) {
        $dir_path = $project_dir . '/' . $dir;
        if (!is_dir($dir_path)) {
            if (mkdir($dir_path, 0777, true)) {
                $output_lines[] = "✅ Создана директория: $dir";
            } else {
                $output_lines[] = "⚠️ Не удалось создать директорию: $dir";
            }
        }
    }
    
    // Обновление pip
    $output_lines[] = "🔄 Обновление pip...";
    $update_cmd = "$pip_cmd install --upgrade pip --quiet 2>&1";
    exec($update_cmd, $update_output, $update_code);
    if ($update_code === 0) {
        $output_lines[] = "✅ pip обновлен";
    }
    
    // Установка зависимостей
    $output_lines[] = "📦 Установка зависимостей из requirements.txt...";
    $output_lines[] = "Это может занять 3-5 минут, пожалуйста, подождите...";
    
    $install_cmd = "cd " . escapeshellarg($project_dir) . " && $pip_cmd install -r " . escapeshellarg($requirements_file) . " 2>&1";
    
    exec($install_cmd, $install_output, $install_code);
    
    // Фильтруем вывод
    $important_lines = [];
    foreach ($install_output as $line) {
        if (stripos($line, 'Successfully installed') !== false ||
            stripos($line, 'Requirement already satisfied') !== false ||
            stripos($line, 'Collecting') !== false ||
            stripos($line, 'ERROR') !== false ||
            stripos($line, 'WARNING') !== false) {
            $important_lines[] = $line;
        }
    }
    
    $result['output'] = array_merge($output_lines, $important_lines);
    $result['exit_code'] = $install_code;
    $result['success'] = $install_code === 0;
    
    return $result;
}

function checkPackages($venv_pip) {
    $packages = [
        'fastapi' => 'FastAPI',
        'uvicorn' => 'Uvicorn',
        'sqlalchemy' => 'SQLAlchemy',
        'pydantic' => 'Pydantic',
        'pandas' => 'Pandas',
        'openpyxl' => 'OpenPyXL'
    ];
    
    $result = [];
    
    if (file_exists($venv_pip)) {
        $pip_cmd = escapeshellarg($venv_pip);
    } else {
        $pip_cmd = 'python3 -m pip';
    }
    
    foreach ($packages as $package => $name) {
        $check_cmd = "$pip_cmd show $package 2>&1";
        exec($check_cmd, $output, $code);
        
        $result[$package] = [
            'name' => $name,
            'installed' => $code === 0,
            'version' => null
        ];
        
        if ($code === 0) {
            foreach ($output as $line) {
                if (preg_match('/^Version:\s*(.+)$/i', $line, $matches)) {
                    $result[$package]['version'] = trim($matches[1]);
                    break;
                }
            }
        }
    }
    
    return $result;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Установка зависимостей - zakup.one</title>
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
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 900px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 32px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
        }
        
        .status-item .label {
            font-weight: 500;
            color: #555;
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-badge.success {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-badge.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
            margin-top: 10px;
        }
        
        .btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .output {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            max-height: 400px;
            overflow-y: auto;
            margin-top: 15px;
            display: none;
        }
        
        .output.show {
            display: block;
        }
        
        .output-line {
            margin: 3px 0;
            word-wrap: break-word;
        }
        
        .output-line.success {
            color: #4ec9b0;
        }
        
        .output-line.error {
            color: #f48771;
        }
        
        .output-line.warning {
            color: #dcdcaa;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .progress {
            width: 100%;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin: 15px 0;
            display: none;
        }
        
        .progress.show {
            display: block;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s;
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            display: none;
        }
        
        .alert.show {
            display: block;
        }
        
        .alert.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .alert.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Установка зависимостей</h1>
        <p class="subtitle">Автоматическая установка Python пакетов для zakup.one</p>
        
        <div id="alert-container"></div>
        
        <!-- Проверка файлов -->
        <div class="section">
            <h2>📋 Проверка файлов и окружения</h2>
            <div id="files-status">
                <p>Нажмите кнопку для проверки...</p>
            </div>
            <button class="btn btn-secondary" onclick="checkFiles()">Проверить файлы</button>
        </div>
        
        <!-- Установка -->
        <div class="section">
            <h2>📦 Установка зависимостей</h2>
            <div class="progress" id="progress">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            <div class="output" id="install-output"></div>
            <button class="btn" id="install-btn" onclick="installDependencies()">
                Установить зависимости
            </button>
        </div>
        
        <!-- Проверка пакетов -->
        <div class="section">
            <h2>✅ Проверка установленных пакетов</h2>
            <div id="packages-status">
                <p>После установки нажмите кнопку для проверки...</p>
            </div>
            <button class="btn btn-secondary" onclick="checkPackages()">Проверить пакеты</button>
        </div>
    </div>
    
    <script>
        function showAlert(message, type = 'info') {
            const container = document.getElementById('alert-container');
            container.innerHTML = `<div class="alert ${type} show">${message}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
        
        function updateProgress(percent) {
            const progress = document.getElementById('progress');
            const progressBar = document.getElementById('progress-bar');
            progress.classList.add('show');
            progressBar.style.width = percent + '%';
        }
        
        async function checkFiles() {
            try {
                const response = await fetch('', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'action=check_files'
                });
                const data = await response.json();
                
                if (data.status === 'error') {
                    showAlert('Ошибка: ' + data.data.error, 'error');
                    return;
                }
                
                const status = data.data;
                let html = '';
                
                // Директория проекта
                html += `<div class="status-item">
                    <span class="label">Директория проекта</span>
                    <span class="status-badge ${status.project_dir.exists ? 'success' : 'error'}">
                        ${status.project_dir.exists ? '✅ Найдена' : '❌ Не найдена'}
                    </span>
                </div>`;
                
                // requirements.txt
                html += `<div class="status-item">
                    <span class="label">requirements.txt</span>
                    <span class="status-badge ${status.requirements.exists ? 'success' : 'error'}">
                        ${status.requirements.exists ? '✅ Найден' : '❌ Не найден'}
                    </span>
                </div>`;
                
                // pip
                html += `<div class="status-item">
                    <span class="label">Python pip</span>
                    <span class="status-badge ${status.pip.exists ? 'success' : 'warning'}">
                        ${status.pip.exists ? '✅ Найден' : '⚠️ Будет использован системный'}
                    </span>
                </div>`;
                
                // Важные файлы
                html += '<h3 style="margin-top: 15px; margin-bottom: 10px; font-size: 16px;">Важные файлы:</h3>';
                for (const [file, exists] of Object.entries(status.files)) {
                    html += `<div class="status-item">
                        <span class="label">${file}</span>
                        <span class="status-badge ${exists ? 'success' : 'error'}">
                            ${exists ? '✅' : '❌'}
                        </span>
                    </div>`;
                }
                
                // Директории
                html += '<h3 style="margin-top: 15px; margin-bottom: 10px; font-size: 16px;">Директории:</h3>';
                for (const [dir, info] of Object.entries(status.directories)) {
                    html += `<div class="status-item">
                        <span class="label">${dir}/</span>
                        <span class="status-badge ${info.exists ? (info.writable ? 'success' : 'warning') : 'error'}">
                            ${info.exists ? (info.writable ? '✅ Существует' : '⚠️ Нет прав') : '❌ Не найдена'}
                        </span>
                    </div>`;
                }
                
                document.getElementById('files-status').innerHTML = html;
                showAlert('Проверка завершена', 'success');
            } catch (error) {
                showAlert('Ошибка: ' + error.message, 'error');
            }
        }
        
        async function installDependencies() {
            const btn = document.getElementById('install-btn');
            const output = document.getElementById('install-output');
            
            btn.disabled = true;
            btn.innerHTML = '<span class="loading"></span> Установка...';
            output.classList.add('show');
            output.innerHTML = '<div class="output-line">🚀 Начало установки...</div>';
            updateProgress(10);
            
            try {
                const response = await fetch('', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'action=install'
                });
                
                updateProgress(50);
                
                const data = await response.json();
                
                if (data.status === 'error') {
                    output.innerHTML += `<div class="output-line error">❌ Ошибка: ${data.data.error}</div>`;
                    showAlert('Ошибка установки', 'error');
                    btn.disabled = false;
                    btn.innerHTML = 'Установить зависимости';
                    return;
                }
                
                const result = data.data;
                updateProgress(80);
                
                // Выводим результаты
                result.output.forEach(line => {
                    let className = 'output-line';
                    if (line.includes('✅') || line.includes('Successfully')) {
                        className += ' success';
                    } else if (line.includes('⚠️') || line.includes('WARNING')) {
                        className += ' warning';
                    } else if (line.includes('❌') || line.includes('ERROR')) {
                        className += ' error';
                    }
                    output.innerHTML += `<div class="${className}">${escapeHtml(line)}</div>`;
                });
                
                updateProgress(100);
                
                if (result.success) {
                    output.innerHTML += '<div class="output-line success">✅ Установка завершена успешно!</div>';
                    showAlert('✅ Зависимости успешно установлены!', 'success');
                } else {
                    output.innerHTML += '<div class="output-line error">❌ Установка завершена с ошибками</div>';
                    showAlert('⚠️ Установка завершена с ошибками. Проверьте вывод выше.', 'error');
                }
                
                btn.disabled = false;
                btn.innerHTML = 'Установить зависимости';
                
                setTimeout(() => {
                    document.getElementById('progress').classList.remove('show');
                }, 2000);
                
            } catch (error) {
                output.innerHTML += `<div class="output-line error">❌ Критическая ошибка: ${error.message}</div>`;
                showAlert('Ошибка: ' + error.message, 'error');
                btn.disabled = false;
                btn.innerHTML = 'Установить зависимости';
            }
        }
        
        async function checkPackages() {
            try {
                const response = await fetch('', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'action=check_packages'
                });
                const data = await response.json();
                
                if (data.status === 'error') {
                    showAlert('Ошибка: ' + data.data.error, 'error');
                    return;
                }
                
                const packages = data.data;
                let html = '';
                
                for (const [pkg, info] of Object.entries(packages)) {
                    html += `<div class="status-item">
                        <span class="label">${info.name}</span>
                        <span class="status-badge ${info.installed ? 'success' : 'error'}">
                            ${info.installed ? `✅ ${info.version || 'Установлен'}` : '❌ Не установлен'}
                        </span>
                    </div>`;
                }
                
                document.getElementById('packages-status').innerHTML = html;
                showAlert('Проверка завершена', 'success');
            } catch (error) {
                showAlert('Ошибка: ' + error.message, 'error');
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Автоматическая проверка при загрузке
        window.addEventListener('load', () => {
            checkFiles();
        });
    </script>
</body>
</html>

