class BandsController < ApplicationController
  load_and_authorize_resource

  def create
    respond_to do |format|
      if @band.save!
        format.html { redirect_to user_bands_url(current_user), :notice => "Band successfully created" }
        format.json { render :json => {:message => "Song version was successfully deleted"} }
      else
        format.html { render :action => "new" }
      end
    end
  end
  
  def destroy
    respond_to do |format|
      @band.destroy
      format.html {redirect_to user_bands_url(current_user), 
        :notice => "Band was successfully deleted"}
      format.json { render :json => {:message => "Band was successfully deleted"} }
    end
  end

  def index
    @bands = @bands.where(:user_ids => params[:user_id]) if params[:user_id]
  end

  def invite
    user = User.find(params[:user])
    request = BandRequest.new :sender => current_user, :receiver => user, :band => @band
    respond_to do |format|
      if request.save!
        format.html { redirect_to bands_url, :notice => "Request sent" }
        format.json { render :json => request }
      else
        # TODO : render errors in html
        format.html { redirect_to bands_url }
        format.json { render :json => request.errors, :status => :unprocessable_entity }
      end
    end
  end

end
