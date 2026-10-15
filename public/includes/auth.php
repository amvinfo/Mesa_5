<?php
require_once __DIR__ . '/connection.php';

function login($username, $password) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE username = ? AND active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_username'] = $user['username'];
        $_SESSION['user_fullname'] = $user['full_name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        return true;
    }
    return false;
}

function isLoggedIn() { return isset($_SESSION['user_id']); }
function requireLogin() { if (!isLoggedIn()) { header('Location: ' . SITE_URL . '/login.php'); exit; } }
function requireRole($roles) { requireLogin(); if (!in_array($_SESSION['user_role'], (array)$roles)) { header('Location: dashboard.php'); exit; } }
function currentUser() { return ['id' => $_SESSION['user_id'] ?? null, 'username' => $_SESSION['user_username'] ?? '', 'fullName' => $_SESSION['user_fullname'] ?? '', 'email' => $_SESSION['user_email'] ?? '', 'role' => $_SESSION['user_role'] ?? '']; }
function isAdmin() { return ($_SESSION['user_role'] ?? '') === 'admin'; }
function isSupervisor() { return in_array($_SESSION['user_role'] ?? '', ['admin', 'supervisor']); }
