# frozen_string_literal: true

require_relative "lib/attractive/rails/version"

Gem::Specification.new do |spec|
  spec.name = "attractive-rails"
  spec.version = Attractive::Rails::VERSION
  spec.authors = ["Rails Designer"]
  spec.summary = "Coming soon 🤫"
  spec.description = "This gem reserves the name 'attractive-rails'. The full Rails integration."
  spec.homepage = "https://attractivejs.railsdesigner.com/"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 3.1"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/rails-designer/attractivejs"

  spec.files = Dir.glob("lib/**/*.rb") + %w[README.md LICENSE.md]
  spec.require_paths = ["lib"]
end
