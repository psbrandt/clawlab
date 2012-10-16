class RequestsController < ApplicationController
  load_and_authorize_resource :class => "Request"
  
  def accept
    session[:return_to] = request.referer
    # TODO : find something else to return with request (message, errors)
    respond_to do |format|
      if @request.update_attribute(:status, "accepted")
        format.html { redirect_to session[:return_to] }
        format.json { render :json => @request }
      else
        # TODO : add error message for html
        format.html { redirect_to session[:return_to] }
        format.json { render :json => @request.errors, :status => :unprocessable_entity }
      end
    end
  end

  # Check whether received or sent requests were asked
  def index
    @requests = case params[:type]
                when "received"
                  current_user.received_requests
                when "sent"
                  current_user.sent_requests
                when "all"
                  current_user.received_requests + current_user.sent_requests
                else
                  raise ActionController::RoutingError.new('Not Found')
                end
  end

  def index_song_version_sharing
    @requests = current_user.sent_requests.where(
      :song_version_id => Moped::BSON::ObjectId(params[:song_version_id])
    )
    render :json => @requests
  end
end
