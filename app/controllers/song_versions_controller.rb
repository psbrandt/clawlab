class SongVersionsController < ApplicationController
  load_and_authorize_resource

  def create
    @song_version = current_user.song_versions.new(params[:song_version])

    # if no parent song was given, create one and set it as parent
    @song = @song_version.song = Song.new unless @song_version.song_id
    
    # create the root_action node
    @song_version.create_root_action

    if @song_version.save! && @song.save!
      render :json => @song_version
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    @song_version.destroy!
  end

  # TODO : allow action to be nil to undo last action
  def undo(action)
    action.undo
    @song_version.save!
  end

  # TODO : allow action to be nil to redo last undone action
  def redo(action)
    action.redo
    @song_version.save!
  end

  def set_title
    action = SongVersionActionSetTitle.new(
      :song_version => @song_version, 
      :title => params[:title]
    )
    action.redo
    if @song_version.save!
      render :json => :ok
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

end
