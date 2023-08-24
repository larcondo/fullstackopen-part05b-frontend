import { useState, useEffect } from "react"
// import axios from 'axios'
import noteService from './services/notes'
import loginService from './services/login'
import Note from "./components/Note"
import Notification from "./components/Notification"

function App(props) {
  const [notes, setNotes] = useState(null)
  const [newNote, setNewNote] = useState('a new note...')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, serUser] = useState(null)

  const hook = () => {
    noteService.getAll()
    .then( initialNotes => {
      setNotes(initialNotes)
    })
  }

  useEffect(hook, [])
  // console.log('render', notes.length, 'notes');

  const addNote = (event) => {
    event.preventDefault()
    // console.log('button clicked', event.target)
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5
    }

    // axios
    //   .post('http://localhost:3001/notes', noteObject)
    //   .then( response => {
    //     // console.log(response)
    //     setNotes(notes.concat(response.data))
    //     setNewNote('')
    //   })
    noteService.create(noteObject)
    .then(returnedNote => {
      setNotes(notes.concat(returnedNote))
      setNewNote('')
    })
  }

  const toggleImportanceOf = (id) => {
    // console.log('importance of ' + id + ' needs to be toggled')
    // console.log(`importance of ${id} needs to be toggled`)
    // const url = `http://localhost:3001/notes/${id}`
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    // axios.put(url, changedNote)
    //   .then(response => {
    //     setNotes(notes.map(n => n.id !== id ? n : response.data))
    //   })
    noteService.update(id, changedNote)
    .then(returnedNote => {
      setNotes(notes.map(note => note.id !== id ? note : returnedNote))
    })
    .catch(error => {
      setErrorMessage(`the note '${note.content}' was already deleted from server`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setNotes(notes.filter(n => n.id !== id))
    })
  }

  const handleNoteChange = (event) => {
    // console.log(event.target.value)
    setNewNote(event.target.value)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password
      })
      serUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input type="text" name="Username" value={username} onChange={({target}) => setUsername(target.value)} />
      </div>
      <div>
        password
        <input type="password" name="Password" value={password} onChange={({target}) => setPassword(target.value)} />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input value={newNote} onChange={handleNoteChange}/>
      <button type="submit">save</button>
    </form>
  )

  const notesToShow = showAll ? notes : notes.filter(note => note.important)

  if (!notes) return null

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      { !user && loginForm() }
      { user && <div>
          <p>{ user.name } logged in</p>
          { noteForm() }
        </div> 
      }

      <div>
        <button onClick={() => setShowAll(!showAll)}>show {showAll ? 'important' : 'all'}</button>
      </div>
      <ul>
        { notesToShow.map( note => 
          <Note key={note.id} 
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)} />)
        }
      </ul>
      <Footer />
    </div>
  )
}

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  }
  
  return(
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science, University of Helsinki 2023</em>
    </div>
  )
}

export default App