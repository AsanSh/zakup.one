#!/usr/bin/env node
/**
 * Скрипт для автоматического создания папки deploy после сборки
 * Запускается автоматически после npm run build
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const frontendDist = path.join(projectRoot, 'frontend', 'dist');
const deployDir = path.join(projectRoot, 'deploy');
const deployFrontend = path.join(deployDir, 'frontend', 'dist');

console.log('📦 Создание папки deploy с frontend/dist...');
console.log(`   Источник: ${frontendDist}`);
console.log(`   Назначение: ${deployFrontend}`);

// Проверяем что dist существует
if (!fs.existsSync(frontendDist)) {
    console.error('❌ Ошибка: frontend/dist не найден!');
    console.error('   Сначала выполните: npm run build');
    process.exit(1);
}

// Создаем структуру deploy
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
    console.log(`✅ Создана папка: ${deployDir}`);
}

const deployFrontendParent = path.dirname(deployFrontend);
if (!fs.existsSync(deployFrontendParent)) {
    fs.mkdirSync(deployFrontendParent, { recursive: true });
    console.log(`✅ Создана папка: ${deployFrontendParent}`);
}

// Копируем dist в deploy/frontend/dist
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    // Удаляем старую папку если существует
    if (fs.existsSync(deployFrontend)) {
        fs.rmSync(deployFrontend, { recursive: true, force: true });
        console.log(`🗑️  Удалена старая папка: ${deployFrontend}`);
    }
    
    // Копируем
    copyRecursiveSync(frontendDist, deployFrontend);
    
    // Подсчитываем файлы
    function countFiles(dir) {
        let count = 0;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                count += countFiles(filePath);
            } else {
                count++;
            }
        }
        return count;
    }
    
    const fileCount = countFiles(deployFrontend);
    const size = getDirSize(deployFrontend);
    
    console.log(`✅ Скопировано в deploy/frontend/dist/`);
    console.log(`   📁 Файлов: ${fileCount}`);
    console.log(`   📊 Размер: ${(size / 1024).toFixed(1)} KB`);
    console.log(`\n🎉 Готово! Папка deploy/frontend/dist/ создана.`);
    
} catch (error) {
    console.error('❌ Ошибка при копировании:', error.message);
    process.exit(1);
}

function getDirSize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            size += getDirSize(filePath);
        } else {
            size += stat.size;
        }
    }
    return size;
}

