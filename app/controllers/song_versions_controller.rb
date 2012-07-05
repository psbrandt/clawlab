class SongVersionsController < ApplicationController
  load_and_authorize_resource

  def create
    @song_version = current_user.song_versions.new(params[:song_version])

    # if no parent song was given, create one and set it as parent
    @song_version.song = Song.new unless @song_version.song_id
    
    # create the root_action node
    @song_version.root_action = SongVersionActionCreate.new

    if @song_version.save! && @song_version.song.save!
      render :json => @song_version
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    @song_version.destroy!
  end

  def undo(action)
    action.undo
  end

  def redo(action)
    action.redo
  end

  def set_title
    action = SongVersionActionSetTitle.new(
      :song_version => @song_version, 
      :title => params[:title]
    )
    action.redo
  end

end
