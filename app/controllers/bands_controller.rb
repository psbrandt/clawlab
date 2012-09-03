class BandsController < ApplicationController
  load_and_authorize_resource

  def index
  end

  def create
    respond_to do |format|
      if @band.save
        format.html { redirect_to bands_url, :notice => "Band successfully created" }
      else
        format.html { render :action => "new" }
      end
    end
  end
end
