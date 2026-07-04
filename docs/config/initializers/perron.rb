Perron.configure do |config|
  # For all options check out:
  # https://perron.railsdesigner.com/docs/configuration/

  # The build mode for Perron. Can be :standalone (SSG, default) or :integrated (alongside your Rails app)
  # config.mode = :standalone

  # Enable Live Reload with DOM Morphing in development
  config.live_reload = true

  config.default_url_options = {host: "attractivejs.railsdesigner.com", protocol: "https", trailing_slash: true}

  # The options hash is passed directly to the chosen library
  config.markdown_options = {
    options: {
      parse: {
        smart: true
      },

      render: {
        unsafe: true
      }
    },

    plugins: {
      syntax_highlighter: {
        theme: "attractive-syntax-theme",
        path: Rails.root.join("app", "themes").to_s
      }
    }
  }


  config.site_name = "Attractive.js"

  # Set meta title suffix
  config.metadata.title_suffix = "Attractive.js"
  config.metadata.title_separator = " — "

  # Set default meta values
  config.metadata.description = "TODO"
  config.metadata.author = "Rails Designer"
end
