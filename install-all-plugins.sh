#!/bin/bash

# Bulk Plugin Installer for Claude Code
# This script installs all available plugins globally

echo "=========================================="
echo "Claude Code Global Plugin Installer"
echo "=========================================="
echo ""

# Counter
total=0
success=0
failed=0

# Claude Code Workflows plugins
workflows_plugins=(
  "accessibility-compliance"
  "agent-orchestration"
  "agent-teams"
  "api-scaffolding"
  "api-testing-observability"
  "application-performance"
  "arm-cortex-microcontrollers"
  "backend-api-security"
  "backend-development"
  "blockchain-web3"
  "business-analytics"
  "c4-architecture"
  "cicd-automation"
  "cloud-infrastructure"
  "code-documentation"
  "code-refactoring"
  "codebase-cleanup"
  "comprehensive-review"
  "conductor"
  "content-marketing"
  "context-management"
  "customer-sales-automation"
  "data-engineering"
  "data-validation-suite"
  "database-cloud-optimization"
  "database-design"
  "database-migrations"
  "debugging-toolkit"
  "dependency-management"
  "deployment-strategies"
  "deployment-validation"
  "developer-essentials"
  "distributed-debugging"
  "documentation-generation"
  "dotnet-contribution"
  "error-debugging"
  "error-diagnostics"
  "framework-migration"
  "frontend-mobile-development"
  "frontend-mobile-security"
  "full-stack-orchestration"
  "functional-programming"
  "game-development"
  "git-pr-workflows"
  "hr-legal-compliance"
  "incident-response"
  "javascript-typescript"
  "julia-development"
  "jvm-languages"
  "kubernetes-operations"
  "llm-application-dev"
  "machine-learning-ops"
  "multi-platform-apps"
  "observability-monitoring"
  "payment-processing"
  "performance-testing-review"
  "product-discovery"
  "product-evaluation"
  "product-ideation-supervisor"
  "product-planning"
  "product-specification"
  "python-development"
  "quantitative-trading"
  "reverse-engineering"
  "security-compliance"
  "security-scanning"
  "seo-analysis-monitoring"
  "seo-content-creation"
  "seo-technical-optimization"
  "shell-scripting"
  "startup-business-analyst"
  "systems-programming"
  "tdd-workflows"
  "team-collaboration"
  "unit-testing"
  "web-scripting"
)

# Claude Plugins Official
official_plugins=(
  "agent-sdk-dev"
  "clangd-lsp"
  "claude-code-setup"
  "claude-md-management"
  "code-review"
  "code-simplifier"
  "commit-commands"
  "csharp-lsp"
  "example-plugin"
  "explanatory-output-style"
  "feature-dev"
  "frontend-design"
  "gopls-lsp"
  "hookify"
  "jdtls-lsp"
  "kotlin-lsp"
  "learning-output-style"
  "lua-lsp"
  "math-olympiad"
  "mcp-server-dev"
  "php-lsp"
  "playground"
  "plugin-dev"
  "pr-review-toolkit"
  "pyright-lsp"
  "ralph-loop"
  "ruby-lsp"
  "rust-analyzer-lsp"
  "security-guidance"
  "session-report"
  "skill-creator"
  "swift-lsp"
  "typescript-lsp"
)

echo "Installing ${#workflows_plugins[@]} plugins from claude-code-workflows..."
echo ""

for plugin in "${workflows_plugins[@]}"; do
  ((total++))
  echo "[$total] Installing $plugin@claude-code-workflows..."
  output=$(claude plugin install "$plugin@claude-code-workflows" 2>&1)
  if echo "$output" | grep -q "Successfully\|already installed"; then
    ((success++))
    echo "  ✓ Success"
  else
    ((failed++))
    echo "  ✗ Failed: $output"
  fi
done

echo ""
echo "Installing ${#official_plugins[@]} plugins from claude-plugins-official..."
echo ""

for plugin in "${official_plugins[@]}"; do
  ((total++))
  echo "[$total] Installing $plugin@claude-plugins-official..."
  output=$(claude plugin install "$plugin@claude-plugins-official" 2>&1)
  if echo "$output" | grep -q "Successfully\|already installed"; then
    ((success++))
    echo "  ✓ Success"
  else
    ((failed++))
    echo "  ✗ Failed: $output"
  fi
done

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo "Total plugins: $total"
echo "Successful: $success"
echo "Failed: $failed"
echo ""
echo "Run 'claude plugin list' to see all installed plugins"
