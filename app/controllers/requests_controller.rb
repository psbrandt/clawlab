class RequestsController < ApplicationController
  load_and_authorize_resource :class => "Request"
  
  def accept
    # TODO : find something else to return with request (message, errors)
    if @request.update_attribute(:status, "accepted")
      render :json => @request
    else
      render :json => @request.errors, :status => :unprocessable_entity
    end
  end

  # Check whether received or sent requests were asked
  def index
    @requests = case params[:type]
                when "received"
                  current_user.received_requests
                when "sent"
                  current_user.sent_requests
                else
                  raise ActionController::RoutingError.new('Not Found')
                end
  end
end
