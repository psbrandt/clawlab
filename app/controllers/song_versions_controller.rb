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
      logger.debug @song_version.inspect
      logger.debug @song_version.tracks.inspect
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
    user = User.where(params[:user]).first
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

  def merge
    other = SongVersion.find params[:song_version_id]
    @song_version.root_action.merge other.root_action, @song_version
    other.audio_sources.each do |audio_source|
      unless @song_version.audio_sources.include? audio_source
        @song_version.audio_sources << audio_source
      end
    end
    if @song_version.save!
      render :json => @song_version
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def merge_track
    other = SongVersion.find params[:other_version_id]
    other_create_action = other.root_action.children.detect { |a|
      a.name == "track_action_create_#{params[:track_id]}"
    }

    begin
      track = @song_version.tracks.find params[:track_id]
      create_action = @song_version.root_action.children.detect { |a|
        a.name == "track_action_create_#{params[track.id]}"
      }
    rescue
      create_action = TrackActionCreate.new(
        :song_version_id => @song_version.id, 
        :params => other_create_action.params
      )
      track = create_action.redo @song_version
    end
      
    other.audio_sources.each do |audio_source|
      unless @song_version.audio_sources.include? audio_source
        @song_version.audio_sources << audio_source
      end
    end

    create_action.merge other_create_action, @song_version
    if @song_version.save!
      render :json => track
    else
      render :json => @song_version.errors
    end
  end

  # TODO : if action_id is nil, undo last action
  def undo
    action = Action.find(params[:action_id])
    action.undo @song_version
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
    action.redo @song_version
    if @song_version.save!
      render :json => { :message => "Redo successed" }
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def update
    set_title if params[:title]
  end
  
  def set_title
    action = SongVersionActionSetTitle.new :title => params[:title]
    action.redo @song_version
    if @song_version.save!
      render :json => @song_version
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def edit
    render :layout => false
  end

end
