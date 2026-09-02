#!/bin/bash
# =====================================================
# SCRIPT PARA SUBIR MUDANÇAS PRO GITHUB
# Use: ./subir.sh "mensagem do commit"
# =====================================================

set -e

# Vai pra pasta do projeto
cd "/Users/nicolascavalheiro/Desktop/Como gravar bons vídeos para o seu perfil pelo celular"

# Mensagem do commit (ou usa genérica)
MSG="${1:-update: mudanças no projeto}"

echo "📦 Adicionando arquivos..."
git add .

echo "📝 Criando commit..."
git commit -m "$MSG" || echo "Nada pra commitar (tudo já tá commitado)"

echo "🚀 Subindo pro GitHub..."
git push

echo ""
echo "✅ Pronto! Vercel vai detectar e fazer deploy automático."
echo "🔍 Acompanhe em: https://vercel.com/seu-projeto/deployments"
