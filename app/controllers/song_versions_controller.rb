class SongVersionsController < ApplicationController
  load_and_authorize_resource

  def create
    @song_version = current_user.song_versions.new params[:song_version]

    # if no parent song was given, create one and set it as parent
    @song_version.song = Song.new(:user => current_user) unless @song_version.song_id
    @song = @song_version.song

    # create the root_action node
    @song_version.create_root_action

    respond_to do |format|
      if @song_version.save! && @song.save!
        format.html { redirect_to songs_url, :notice => "Song version successfully created" }
        format.json { render } # app/views/song_versions/create.json.jbuilder
      else
        # TODO show errors for html
        format.html { render :action => "new" }
        format.json { render :json => @song_version.errors, :status => :unprocessable_entity }
      end
    end
  end

  def destroy
    respond_to do |format|
      begin 
        @song_version.destroy
        format.html {redirect_to songs_url, :notice => "Song version was successfully deleted"}
        format.json { render :json => {:message => "Song version was successfully deleted"} }
      rescue
        not_found
      end
    end
  end

  # TODO : accept user unregistered email and send an invitation by email
  def share
    user = User.find params[:user]
    request = SongVersionSharingRequest.new(
      :sender => current_user, 
      :receiver => user, 
      :song_version_id => @song_version.id)
    respond_to do |format|
      if request.save!
        format.html { redirect_to songs_url, :notice => "Request sent" }
        format.json { render :json => request }
      else
        format.html { redirect_to songs_url }
        format.json { render :json => request.errors, :status => :unprocessable_entity }
      end
    end
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

  def edit
    render :layout => false
  end

end
