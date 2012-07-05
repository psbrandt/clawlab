require 'spec_helper'

describe TrackActionCreate do

  before do
    @user = User.new :email => "dummy@dummy.com", :password => "secret"
    @song = @user.song_versions.new(:title => "dummy project", :bpm => "90", :song => Song.new)
    @song.root_action = SongVersionActionCreate.new
  end

  it "has the right name" do
    a = TrackActionCreate.new(:song_version => @song, :params => {:name => "Dummy track"})
    a.redo
    a.name.should eq("track_action_create_#{a.track.id}")
  end
    
end
