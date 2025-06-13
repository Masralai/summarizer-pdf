from flask import Flask,request,jsonify
from flask_cors import CORS #Allows frontend to talk to backend (different ports)


app = Flask(__name__)
CORS(app)

@app.route('/health',methods=['GET'])
def health_check(): #testing
    """
    This endpoint tells us if our backend is running correctly.
    Every good API needs a health check endpoint for debugging.
    """    
    return jsonify({"status":"Backend is running!","message":"Flask server is healthy"})

@app.route('/summarize',methods=['POST'])
def summarize_pdf():
    """
    This will be our main endpoint for processing PDFs.
    We use POST because we're sending data (the PDF file) to the server.
    For now, it just returns a placeholder response.
    """   
    return jsonify({
            "summary": "PDF processing coming soon!", 
            "status": "endpoint ready"
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0',port =5000,debug=True)





