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
      begin 
        @band.destroy
        format.html {redirect_to user_bands_url(current_user), 
          :notice => "Band was successfully deleted"}
        format.json { render :json => {:message => "Band was successfully deleted"} }
      rescue
        not_found
      end
    end
  end

  def index
    @bands = @bands.where(:user_ids => params[:user_id]) if params[:user_id]
  end

end
