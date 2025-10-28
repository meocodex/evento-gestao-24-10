#!/bin/bash

# Script para configurar Branch Protection Rules via GitHub API
# Requer: GitHub CLI (gh) instalado e autenticado
#
# Uso:
#   OWNER=seu-usuario REPO=seu-repositorio ./scripts/setup-branch-protection.sh
#
# Ou defina as variáveis diretamente no script abaixo

set -e

# ============================================
# CONFIGURAÇÃO
# ============================================

# Defina seu usuário/organização e repositório
OWNER="${OWNER:-}"
REPO="${REPO:-}"
BRANCH="${BRANCH:-main}"

# ============================================
# VALIDAÇÕES
# ============================================

if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  echo "❌ Erro: Variáveis OWNER e REPO são obrigatórias!"
  echo ""
  echo "Uso:"
  echo "  OWNER=seu-usuario REPO=seu-repositorio $0"
  echo ""
  echo "Ou edite o script e defina as variáveis diretamente."
  exit 1
fi

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
  echo "❌ Erro: GitHub CLI (gh) não está instalado!"
  echo ""
  echo "Instale via:"
  echo "  macOS:   brew install gh"
  echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
  echo "  Windows: https://github.com/cli/cli#windows"
  exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
  echo "❌ Erro: GitHub CLI não está autenticado!"
  echo ""
  echo "Execute: gh auth login"
  exit 1
fi

echo "🔧 Configurando Branch Protection Rules..."
echo "   Repository: $OWNER/$REPO"
echo "   Branch: $BRANCH"
echo ""

# ============================================
# APLICAR PROTEÇÕES
# ============================================

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/$OWNER/$REPO/branches/$BRANCH/protection" \
  -f required_status_checks='{"strict":true,"contexts":["lint-and-test"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":0}' \
  -f restrictions=null \
  -f required_linear_history=false \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f block_creations=false \
  -f required_conversation_resolution=false \
  -f lock_branch=false \
  -f allow_fork_syncing=false

echo ""
echo "✅ Branch Protection Rules configuradas com sucesso!"
echo ""
echo "📋 Configurações aplicadas:"
echo "   ✅ Require status checks: lint-and-test"
echo "   ✅ Require branches to be up to date"
echo "   ✅ Enforce for administrators"
echo "   ✅ Dismiss stale reviews on new commits"
echo ""
echo "🔗 Verificar em:"
echo "   https://github.com/$OWNER/$REPO/settings/branches"
