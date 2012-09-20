source 'https://rubygems.org'

gem 'rails', '3.2.6'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'



# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platform => :ruby

  gem 'uglifier', '>= 1.0.3'
end



# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

gem "devise", ">= 2.1.0"
gem "jquery-rails"
gem "bson_ext"
gem "mongoid", ">= 2.4.11"

# Tests
gem "rspec-rails", ">= 2.10.1", :group => [:development, :test]
gem "factory_girl_rails", ">= 3.3.0", :group => [:development, :test]

group :test do
  gem "database_cleaner", ">= 0.8.0"
  gem "mongoid-rspec", ">= 1.4.4"
  gem "email_spec", ">= 1.2.1"
  gem "cucumber-rails", ">= 1.3.0", :require => false
  gem "capybara", ">= 1.1.2"
  gem "shoulda"
  gem "launchy", ">= 2.1.0"
end

gem "haml", ">= 3.0.0"

gem "cancan"

gem "carrierwave"
gem "carrierwave-mongoid", :require => 'carrierwave/mongoid'
gem "mini_magick"