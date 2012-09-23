class AudioSourcesController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :audio_source, :through => :song_version

  def create
    # Get audio source from :files array
    @audio_source.audio = (params[:files] || []).shift
    @audio_source.uploaded_by = current_user
    respond_to do |format|
      if @audio_source.save!
        format.html { redirect_to song_version_url(@song_version), :notice => "Audio file successfully created" }
        format.json { render :json => @audio_source }
      else
        # TODO : show error in html
        format.html { render :action => "new" }
      end
    end
  end

  def destroy
    respond_to do |format|
      @audio_source.destroy
      format.json { render :json => {:message => "Audio source was successfully deleted"} }
    end
  end

end
