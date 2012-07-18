class RequestsController < ApplicationController
  before_filter :find_requests
  load_and_authorize_resource
  
  def accept
    @request.update_attribute(:status, "accepted")
  end

  private

  # Check whether received or sent requests were asked
  def find_requests
    @requests = case params[:type]
                when "received"
                  current_user.received_requests
                when "sent"
                  current_user.sent_requests
                else # should never happen
                  [] #TODO redirect to an error page instead (404?)
                end
  end
end
