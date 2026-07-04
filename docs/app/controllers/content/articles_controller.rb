class Content::ArticlesController < ApplicationController
  layout "articles"

  def index
    @metadata = {
      title: "Documentation"
    }

    @resources = Content::Article.all
  end

  def show
    @resource = Content::Article.find!(params[:id])
  end
end
