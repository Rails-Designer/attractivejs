module ApplicationHelper
  def attractivejs_version
    @attractivejs_version ||= ENV["ATTRACTIVE_VERSION"] || package_json_version
  end

  private

  def package_json_version
    path = Rails.root.join("..", "package.json")
    return "0.0.0" unless path.exist?

    JSON.parse(path.read).fetch("version", "0.0.0")
  end
end
