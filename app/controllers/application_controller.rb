class ApplicationController < ActionController::Base
  protect_from_forgery
  check_authorization :unless => :devise_controller?

  # Needed to display index
  skip_authorization_check :only => :index

  rescue_from Mongoid::Errors::DocumentNotFound do |exception|
    render :json => {:status => :error, :message => exception.inspect}, :status => :not_found
  end

  def after_sign_in_path_for(resource)
    songs_url
  end

  def after_update_path_for(resource)
    edit_user_registration_url
  end

  rescue_from CanCan::AccessDenied do |exception|
    if signed_in?
      render :json => {:status => :error, :message => "You don't have permission to #{exception.action} #{exception.subject.class.to_s.pluralize}"}, :status => 403
    else
      render :json => {:status => :error, :message => "You must be logged in to do that!"}, :status => 401
    end
  end

end

