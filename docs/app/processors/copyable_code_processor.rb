class CopyableCodeProcessor < Perron::HtmlProcessor::Base
  include RailsIcons::Helpers::IconHelper

  def process
    @html.css("pre").each do |pre|
      next if skippable? pre

      id = "pre_#{Random.hex(4)}"

      wrapper = Nokogiri::XML::Node.new("div", @html)
      wrapper["data-slot"] = "code"

      button = Nokogiri::XML::Node.new("button", @html)
      button["type"] = "button"
      button["class"] = "icon"
      button["@action"] = "copy"
      button["@target"] = id
      button["data-copy-feedback"] = "4500"

      button.inner_html = [ copy_icon, success_icon ].join

      pre["id"] = id
      pre.wrap wrapper
      pre.add_previous_sibling button
    end
  end

  private

  def skippable?(pre)
    [ "shell-session", "console" ].include? pre["lang"]
  end

  def copy_icon = icon("clipboard-document", data: { slot: "icon-copy" })

  def success_icon = icon("clipboard-document-list", data: { slot: "icon-copied" })
end
