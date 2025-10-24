import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import "./Register.scss";
import { useGetSponserRef, useSignupMutation } from "../../api/Auth";
import { LoadingComponent } from "../../App";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const refCode = searchParams.get("ref") || "";
  const [formData, setFormData] = useState<Record<string, string>>({
    Sponsor_code: "",
    Sponsor_name: "",
    gender: "",
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileno: "",
    pincode: "",
  });
  
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [genderError, setGenderError] = useState(false);
  
  const { 
    data: sponsorData,
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetSponserRef(formData.Sponsor_code);

  // Auto-populate sponsor code from URL when component mounts
  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        Sponsor_code: refCode
      }));
    }
  }, [refCode]);

  // Fetch sponsor details when sponsor code changes
  useEffect(() => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) {
      refetch();
    }
  }, [formData.Sponsor_code, refetch]);

  // Update sponsor name when sponsor data is fetched
  useEffect(() => {
    if (sponsorData && sponsorData.name) {
      setFormData(prev => ({
        ...prev,
        Sponsor_name: sponsorData.name
      }));
    } else if (isError) {
      // Clear sponsor name if there's an error
      setFormData(prev => ({
        ...prev,
        Sponsor_name: ""
      }));
    }
  }, [sponsorData, isError]);

  const sponsorError = isError && error instanceof Error ? error.message : "";

  const handleSponsorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSponsorCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      Sponsor_code: newSponsorCode,
      Sponsor_name: "" // Clear sponsor name when code changes
    }));
  };

  const handleSponsorCodeBlur = () => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) {
      refetch();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setErrorMessage(""); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      gender: e.target.value,
    }));
    setGenderError(false);
  };

  const { mutate, isPending } = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.gender) {
      setGenderError(true);
      return;
    }
    
    if (!formData.password || formData.password.length <= 5) {
      setErrorMessage("Password must be at least 6 characters*");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!formData.Sponsor_code || formData.Sponsor_code.length < 5) {
      setErrorMessage("Valid sponsor code is required");
      return;
    }

    if (!formData.Sponsor_name) {
      setErrorMessage("Please enter a valid sponsor code");
      return;
    }

    try {
      // Create the final data object with the required structure
      const finalData = {
        sponsor_id: formData.Sponsor_code,  // Using Sponsor_code as sponsor_id
        Sponsor_code: formData.Sponsor_code,
        Sponsor_name: formData.Sponsor_name,
        ...formData // Spread all other form data
      };

      mutate(finalData);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "66px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Card
          sx={{
            width: "100%",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            backgroundColor: "#fff",
          }}
        >
          <CardContent sx={{ padding: "2rem" }}>
            <Typography
              component="h1"
              variant="h5"
              sx={{ color: "#7e22ce", mb: 3, textAlign: "center" }}
            >
              Create Account
            </Typography>
            
            {refCode && (
              <Typography
                variant="body2"
                sx={{ 
                  color: "#10b981", 
                  marginBottom: "15px", 
                  textAlign: "center",
                  fontStyle: "italic"
                }}
              >
                You were referred by someone! Sponsor code has been auto-filled.
              </Typography>
            )}
            
            <Typography
              variant="body1"
              sx={{ color: "#7e22ce", marginBottom: "15px", width: "50%" }}
            >
              Referral details
            </Typography>
            
            <Box
              component="form"
              onSubmit={handleSubmit}
              className="reg-textfield-container"
            >
              <Box className="textfield-content">
                <TextField
                  required
                  name="Sponsor_code"
                  label="Sponsor Code"
                  placeholder="Sponsor code"
                  value={formData.Sponsor_code}
                  onChange={handleSponsorCodeChange}
                  onBlur={handleSponsorCodeBlur}
                  error={(formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5) || (formData.Sponsor_code.length >= 5 && !!sponsorError)}
                  helperText={
                    formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5
                      ? "Sponsor code must be at least 5 characters."
                      : formData.Sponsor_code.length >= 5 && sponsorError
                      ? sponsorError
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />

                <TextField
                  required
                  name="Sponsor_name"
                  label="Sponsor Name"
                  placeholder="Sponsor Name"
                  value={formData.Sponsor_name}
                  onChange={handleChange}
                  disabled={true} // Make it read-only since it's auto-filled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
              </Box>
              
              <Box className="textfield-content">
                <TextField
                  required
                  id="Name"
                  label="Full Name"
                  name="Name"
                  autoComplete="Name"
                  autoFocus
                  placeholder="Enter your full name"
                  value={formData.Name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
                
                <TextField
                  required
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
                
                <TextField
                  required
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
                
                <TextField
                  required
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errorMessage} 
                  helperText={errorMessage} 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
                
                <TextField
                  required
                  label="Mobile Number"
                  name="mobileno"
                  type="tel"
                  autoComplete="mobileno"
                  placeholder="Enter your number"
                  value={formData.mobileno}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
                
                <TextField
                  required
                  label="Pin Code"
                  name="pincode"
                  autoComplete="pincode"
                  placeholder="Enter your pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: "#7e22ce" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#7e22ce",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#7e22ce",
                      },
                    },
                  }}
                />
                
                <FormControl
                  error={!!genderError}
                  className="form-control"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <FormLabel className="form-label" sx={{ color: "#7e22ce!important" }}>
                    <WcIcon sx={{ color: "#7e22ce" }} />
                    Gender:
                  </FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleRadioChange}
                    className="radio-grp"
                  >
                    <FormControlLabel
                      value="Male"
                      className="form-control-label"
                      control={
                        <Radio sx={{ "&.Mui-checked": { color: "#7e22ce" } }} />
                      }
                      label="Male"
                    />
                    <FormControlLabel
                      className="form-control-label"
                      value="Female"
                      control={
                        <Radio sx={{ "&.Mui-checked": { color: "#7e22ce" } }} />
                      }
                      label="Female"
                    />
                  </RadioGroup>
                </FormControl> 
                
                {genderError && (
                  <FormHelperText sx={{color:"#d32f2f",marginTop:"-20px"}}>  
                    Please select your gender*
                  </FormHelperText>
                )}
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                      sx={{ color: "#7e22ce" }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#7e22ce" }}>
                      I accept the Terms and Conditions
                    </Typography>
                  }
                  className="FormControlLabel"
                />
                
                <Box className="btn-container">
                  <Button
                    type="submit"
                    variant="contained"
                    className="signup-btn"
                    disabled={!isChecked || isPending}
                    sx={{
                      backgroundColor: "#7e22ce",
                      marginRight: "130px",
                      "&:hover": {
                        backgroundColor: "#581c87",
                      },
                    }}
                  >
                    {isPending ? "Registering..." : "Register"}
                  </Button>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
              Have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#7e22ce",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Login
              </Link>
            </Typography>
            
            <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
              <Link 
                to="/recover-password" 
                style={{
                  color: "#7e22ce",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Recover Password
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
      {(isLoading || isPending) && <LoadingComponent />}
    </Container>
  );
};

export default Register;