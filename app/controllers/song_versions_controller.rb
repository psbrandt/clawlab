class SongVersionsController < ApplicationController
  load_and_authorize_resource

  def create
    @song_version = current_user.song_versions.new(params[:song_version])

    # if no parent song was given, create one and set it as parent
    @song = @song_version.song = Song.new(:created_by => current_user) unless @song_version.song_id
    
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

  # TODO : if action_id is nil, undo last action
  def undo
    action = Action.find(params[:action_id])
    action.undo
    @song_version.save!
    if @song_version.save!
      render :json => { :message => "Undo successed" }
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  # TODO : if action_id is nil, redo last undone action
  def redo
    action = Action.find(params[:action_id])
    action.redo
    if @song_version.save!
      render :json => { :message => "Redo successed" }
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def set_title
    action = SongVersionActionSetTitle.new(
      :song_version => @song_version, 
      :title => params[:title]
    )
    action.redo
    if @song_version.save!
      render :json => { :message => "Title set" }
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

end
