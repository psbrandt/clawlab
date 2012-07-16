class TracksController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :through => :song_version

  def create
    action = TrackActionCreate.new(
      :song_version_id => @song_version.id, 
      :params => params[:track]
    )
    if @track = action.redo
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    action = TrackActionDestroy.new :track => @track
    action.redo
  end

  def set_name
    action = TrackActionSetName.new :track => @track, :name => params[:name]
    action.redo
    if @track.save!
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

  def set_volume
    action = TrackActionSetVolume.new :track => @track, :volume => params[:volume]
    action.redo
    if @track.save!
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

end
