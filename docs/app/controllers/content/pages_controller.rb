class Content::PagesController < ApplicationController
  def root
    @resource = Content::Page.root

    render @resource.inline
  end
end
