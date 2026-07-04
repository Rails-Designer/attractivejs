Rails.application.routes.draw do
  resources :actions, module: :content, path: "docs/actions", only: %w[show]
  resources :articles, module: :content, path: "docs", only: %w[index show]

  root to: "content/pages#root"
end
