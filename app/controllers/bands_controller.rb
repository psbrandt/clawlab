class BandsController < ApplicationController
  load_and_authorize_resource

  def create
    respond_to do |format|
      if @band.save!
        format.html { redirect_to user_bands_url, :notice => "Band successfully created" }
      else
        format.html { render :action => "new" }
      end
    end
  end
  
  def index
    @bands = @bands.where(:user_ids => params[:user_id]) if params[:user_id]
  end

end
