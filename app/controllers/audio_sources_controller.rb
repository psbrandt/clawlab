class AudioSourcesController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :audio_source, :through => :song_version

  def create
    respond_to do |format|
      if @audio_source.save!
        format.html { redirect_to song_version_url(@song_version), :notice => "Audio file successfully created" }
      else
        # TODO : show error in html
        format.html { render :action => "new" }
      end
    end
  end

end
