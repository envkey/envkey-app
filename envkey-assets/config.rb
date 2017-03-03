require 'slim'
require 'sass'
require 'sass-globbing'
require 'dotenv'

build_env =  =
  if build?
    ENV["PRODUCTION_BUILD"] ? "production" : "staging"
  else
    "development"
  end

Dotenv.load(".env.#{build_env}")

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page '/path/to/file.html', layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy '/this-page-has-no-template.html', '/template-file.html', locals: {
#  which_fake_page: 'Rendering a fake page with a local variable' }

###
# Helpers
###

# Determine build environment
config[:build_env] = build_env

set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :fonts_dir, 'fonts'

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
  activate :sprockets
end

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     'Helping'
#   end
# end

# Build-specific configuration
configure :build do
  activate :sprockets

  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # Append a hash to asset urls (make sure to use the url helpers)
  activate :asset_hash

  #Use relative URLs
  activate :relative_assets
end
