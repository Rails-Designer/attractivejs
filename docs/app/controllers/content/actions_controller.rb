class Content::ActionsController < Content::ArticlesController
  def show
    @resource = Content::Action.find!(params[:id])
  end
end
