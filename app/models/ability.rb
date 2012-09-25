class Ability
  include CanCan::Ability

  def initialize(user)
    # Define abilities for the passed in user here. For example:
    # user ||= User.new # guest user (not logged in)
    can :read, User
    can :read, Band
    if user
      # managing friends
      can :read, User #TODO, :id => user.friend_ids
      can :add_friend, User

      # bands
      can [:create, :read], Band
      can [:manage, :invite], Band, :user_ids => user.id

      # managing requests
      can [:read, :destroy], Request, :sender_id => user.id
      # TODO : can remove requests from received_requests (destroy?)
      can [:read, :update, :accept], Request, :receiver_id => user.id
      
      # songs
      can :manage, Song, :user_id => user.id
      
      # comments
      can :read, Comment
      can :manage, Comment, :user_id => user.id

      # song versions
      # User can read all song versions of a song he's involved in and create his
      can [:read, :create], SongVersion, :song => { :id => user.song_ids }
      # he can manage a song version he owns
      can [:manage, :undo, :redo, :share], SongVersion, :user_id => user.id
      # audio sources
      can :manage, AudioSource
      
      # song version action tree
      can :manage, SongVersionActionCreate, :song_version => { :user_id => user.id }

      # tracks
      can :manage, Track, :song_version => { :user_id => user.id }
      
      # clips
      can :manage, Clip,:track => { :song_version => { :user_id => user.id } }
    end
    # can read root_action if song_version.song.users includes user
    # can :read, SongVersionActionCreate, :song_version => { :song_id => ...

    #
    # The first argument to `can` is the action you are giving the user permission to do.
    # If you pass :manage it will apply to every action. Other common actions here are
    # :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on. If you pass
    # :all it will apply to every resource. Otherwise pass a Ruby class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details: https://github.com/ryanb/cancan/wiki/Defining-Abilities
  end
end
