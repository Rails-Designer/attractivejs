Rails.application.routes.draw do
  resources :actions, module: :content, path: "docs/actions", only: %w[show]
  resources :articles, module: :content, path: "docs", only: %w[index show] do
    get ":id.md", to: "articles/markdown#show", as: :markdown, on: :collection
  end


  root to: "content/pages#root"
end
